package parary.anipia;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;

public class AniGodGrabber {

	private static final String BASE_URL = "https://anigod.com";
	private static Scanner		scan;

	public static void main( String[] args ) throws IOException, URISyntaxException {
		//		scan = new Scanner( System.in );
		//		getWeekComnmand( getAniList() );

	}

	private static void getWeekComnmand( HashMap<String, Map<String, String>> weekAniMap ) throws IOException, URISyntaxException {

		System.err.println( " Insert Ani ID or Command(exit)" );

		String id = scan.nextLine();

		if ( id.equals( "exit" ) )
			System.exit( 0 );
		else if ( weekAniMap.get( id ) == null ) {
			System.err.println( "Invalid id, insert again." );
			getWeekComnmand( weekAniMap );
		} else {
			getSeriesCommand( weekAniMap.get( id ).get( "url" ) );
		}
	}

	private static void getSeriesCommand( String url ) throws IOException, URISyntaxException {
		
		HashMap<String, Map<String, String>> seriesAniMap = getAniSeries( url );

		System.err.println( " Insert Series ID or Command(exit, before)" );

		String id = scan.nextLine();

		if ( id.equals( "exit" ) ) {
			scan.close();
			System.exit( 0 );
		} else if ( id.equals( "before" ) )
			getWeekComnmand( getAniList() );
		else if ( seriesAniMap.get( id ) == null ) {
			System.err.println( "Invalid id, insert again." );
			getSeriesCommand( url );
		} else {
			getEpisodeUrl( seriesAniMap.get( id ).get( "url" ) );
			getSeriesCommand( url );
		}
	}

	private static void getEpisodeUrl( String episodeUrl ) throws IOException, URISyntaxException {

		Connection connction = Jsoup.connect( episodeUrl );
		connction.header( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );
		connction.header( "referer", "http://viid.me/qpvAPr?utm_source=anigod.gryfindor.com&utm_medium=QL&utm_name=1" );
		Document doc = connction.get();

		String fullHtml = doc.html();

		String key = "var videoID = '";
		int startIdx = fullHtml.indexOf( key );
		int endIdx = fullHtml.indexOf( "';", startIdx );

		String videoId = fullHtml.substring( startIdx + key.length(), endIdx ).replace( "\\/", "%2F" ).replace( "\\x2b", "%2B" );

		String videoUrl = BASE_URL + "/video?id=" + videoId + "&ts=" + System.currentTimeMillis();

		URL url = new URL( videoUrl );
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		con.setRequestProperty( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );
		con.setRequestProperty( "referer", "http://viid.me/qpvAPr?utm_source=anigod.gryfindor.com&utm_medium=QL&utm_name=1" );
		con.setInstanceFollowRedirects( false );
		con.connect();

		String streamUrl = con.getHeaderField( "Location" );

		con.disconnect();

		java.awt.Desktop.getDesktop().browse( new URI( streamUrl ) );
	}

	private static HashMap<String, Map<String, String>> getAniSeries( String aniUrl ) throws IOException {
		HashMap<String, Map<String, String>> result = new HashMap<>();

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
			System.out.println( "Series ID : " + seriesId + " " + seriesItem.get( "description" ) );
			
			result.put( String.valueOf( seriesId ), seriesItem );
			seriesId++;
		}

		return result;
	}

	private static HashMap<String, Map<String, String>> getAniList() throws IOException {
		
		HashMap<String, Map<String, String>> result = new HashMap<>();
		
		int weekIdx = 1;
		Connection connction = Jsoup.connect( BASE_URL );
		connction.header( "User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36" );
		Document doc = connction.get();

		Elements rows = doc.select( "div.index-table-container" );

		for ( int i = 0; i < rows.size(); i++ ) {
			Element container = rows.get( i );

			System.out.println( container.child( 0 ).child( 0 ).ownText() );

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

				System.out.println( "\tID : " + key + " " + weekItem.get( "name" ) );

				result.put( key, weekItem );
				itemIdx++;
			}
			weekIdx++;
		}
		return result;
	}
}
