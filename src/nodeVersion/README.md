// dependency list
express
    - node web application fw

unirest
    - node http/https request library

cheerio
    - node html parser (simple parser), html str to DOM obj

bluebird
    - node promise library


// run AniGodGrabberNode server
node AniGodGrabberNode.js

// rest api
/getAniList
    - desc: retrun ani list
    - retrun: json

/getAniSeries
    - parma: url
        e.g) /getAniSeries?url=http://address....
        this url is aniUrl
    - desc: return ani series list
            you can get aniUrl address using `getAniList` api
    - return: json

/getEpisodeUrl
    - parma: url
        e.g) /getEpisodeUrl?url=/episode/address....
        this url is episodeUrl
    - desc: return ani series list
            you can get episodeUrl address using `getAniSeries` api
    - return: json

// develop tool
nodemon
    - 설명: 서버 코드 수정후 save하면 서버 자동 restart해주는 tool
    - 설치: npm install -g nodemon
    - 사용: nodemon AniGodGrabberNode.js
            -- nodemon --debug AniGodGrabberNode.js  디버그 모드로 실행시 (5858) port
            -- nodemon --debug=7000 AniGodGrabberNode.js  디버그 모드로 실행시 (7000) port
            -- nodemon --debug-brk AniGodGrabberNode.js  디버그 모드로 실행 + 실행하자마자 첫라인 breakpoint

node-inspector
    - 설명: 서버코드를 chrome의 inspector도구를 이용해서 debug할 수 있게 해주는 툴
    - 설치: npm install -g node-inspector
    - 사용: node-inspector -d=3001 &
            -- &는 백그라운드 실행
            -- 포트지정 없으면, 기본 5858 포트로 실행
            -- node-inspector를 실행한뒤, http://127.0.0.1:8080/debug?port=3001 로 브라우저에서 접속해서 디버깅
    - 주의: node버전이 높으면 에러 발생하고 정상 동작 하지 않을 수 있음
            https://github.com/node-inspector/node-inspector/issues/905
    - 대체 방법: node --inspect AniGodGrabberNode.js 명령어 사용해서 chrome으로 디버깅
