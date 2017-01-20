package parary.anipia;

import java.io.BufferedWriter;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class AniGodGrabberServlet extends HttpServlet {

	private static final long	serialVersionUID	= -8967773370442800047L;
	private static final String BASE_URL = "https://anigod.com";
	private Gson				gson				= new GsonBuilder().disableHtmlEscaping().create();

	@Override
	protected void doGet( HttpServletRequest req, HttpServletResponse resp ) throws ServletException, IOException {
		String mode = req.getParameter( "mode" );
		String url = req.getParameter( "url" );
		resp.setCharacterEncoding( "UTF-8" );
		resp.setContentType( "application/json; charset=UTF-8" );
		resp.addHeader( "Access-Control-Allow-Origin", "*" );

		BufferedWriter bw = new BufferedWriter( resp.getWriter() );
		
		if ( mode.equals( "episode" ) && url != null ) {
			try {
				String aniUrl = getEpisodeUrl( url );
				bw.write( gson.toJson( aniUrl ) );
			} catch ( URISyntaxException e ) {
				e.printStackTrace();
			}
		} else if ( mode.equals( "series" ) && url != null ) {
			bw.write( gson.toJson( getAniSeries( url ) ) );
		} else if ( mode.equals( "ani" ) ) {
			bw.write( gson.toJson( getAniList() ) );
		} else {
			bw.write( gson.toJson( "ERROR" ) );
		}

		bw.flush();
		bw.close();
	}

	private String getEpisodeUrl( String episodeUrl ) throws IOException, URISyntaxException {

		Connection connction = Jsoup.connect( episodeUrl );
		connction.header( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );
		connction.header( "referer", "http://viid.me/qpvAPr?utm_source=anigod.gryfindor.com&utm_medium=QL&utm_name=1" );
		Document doc = connction.get();

		String fullHtml = doc.html();

		String key = "var videoID = '";
		int startIdx = fullHtml.indexOf( key );
		int endIdx = fullHtml.indexOf( "';", startIdx );

		String videoId = fullHtml.substring( startIdx + key.length(), endIdx ).replace( "\\/", "%2F" ).replace( "\\x2b", "%2B" ).replace( "=", "%3d" );

		String videoUrl = BASE_URL + "/video?id=" + videoId + "&ts=" + System.currentTimeMillis();
		//		System.out.println( "execute " + videoUrl );
		//		java.awt.Desktop.getDesktop().browse( new URI( videoUrl ) );

		return videoUrl;
	}

	private ArrayList<Map<String, String>> getAniSeries( String aniUrl ) throws IOException {
		ArrayList<Map<String, String>> result = new ArrayList<>();

		Connection connction = Jsoup.connect( aniUrl );
		connction.header( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );

		Document doc = connction.get();
		Elements rows = doc.select( "[itemtype=http://schema.org/TVEpisode]" );

		int seriesId = 1;

		for ( int i = 0; i < rows.size(); i++ ) {
			Element container = rows.get( i );
			HashMap<String, String> seriesItem = new HashMap<>();
			seriesItem.put( "name", container.childNode( 1 ).childNode( 1 ).attr( "content" ) );
			seriesItem.put( "description", container.childNode( 1 ).childNode( 3 ).attr( "content" ) );
			seriesItem.put( "url", container.childNode( 1 ).childNode( 5 ).attr( "content" ) );
			Elements links = container.select( ".table-link" );
			if ( links.size() > 0 ) {
				seriesItem.put( "real", links.attr( "href" ) );
			}
			//			System.out.println( "Series ID : " + seriesId + " " + seriesItem.get( "description" ) );
			
			//			result.put( String.valueOf( seriesId ), seriesItem );
			result.add( seriesItem );
			seriesId++;
		}

		return result;
	}

	private ArrayList<Map<String, String>> getAniList() throws IOException {
		
		ArrayList<Map<String, String>> result = new ArrayList<>();
		
		int weekIdx = 1;
		Connection connction = Jsoup.connect( BASE_URL );
		connction.header( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );
		Document doc = connction.get();

		Elements rows = doc.select( "div.index-table-container" );

		for ( int i = 0; i < rows.size(); i++ ) {
			Element container = rows.get( i );

			String weekOfDay = container.child( 0 ).child( 0 ).ownText();
			//			System.out.println( weekDay );

			List<Node> itemsOfDay = container.child( 1 ).child( 1 ).childNodes();
			int itemIdx = 1;
			for ( int j = 0; j < itemsOfDay.size(); j++ ) {
				Node item = itemsOfDay.get( j );

				if ( !item.nodeName().equals( "tr" ) )
					continue;

				item = item.childNode( 1 );
				HashMap<String, String> weekItem = new HashMap<>();

				if ( item.childNodeSize() > 1 ) {
					weekItem.put( "name", item.childNode( 1 ).attr( "content" ) );
					weekItem.put( "thumbnailUrl", item.childNode( 5 ).attr( "content" ) );
					weekItem.put( "url", item.childNode( 7 ).attr( "content" ) );
				} else {
					weekItem.put( "name", item.childNode( 0 ).attr( "title" ) );
					weekItem.put( "thumbnailUrl", item.childNode( 0 ).childNode( 0 ).attr( "src" ) );
					weekItem.put( "url", item.childNode( 0 ).attr( "href" ) );
				}

				String key = String.valueOf(weekIdx) + String.valueOf(itemIdx);

				//				System.out.println( "\tID : " + key + " " + weekItem.get( "name" ) );
				weekItem.put( "weekOfDay", weekOfDay );
				//				result.put( key, weekItem );
				result.add( weekItem );
				itemIdx++;
			}
			weekIdx++;
		}
		return result;
	}
}
