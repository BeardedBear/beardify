module Youtube exposing (Snippet, Video, Youtube, decodeSnippet, decodeVideo, decodeYoutube, getVideos)

import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Token exposing (..)


type alias VideoId =
    { videoId : String
    }


decodeVideoId : Decode.Decoder VideoId
decodeVideoId =
    Decode.map VideoId
        (Decode.field "videoId" Decode.string)


type alias Snippet =
    { channelId : String
    , channelTitle : String
    , title : String
    }


decodeSnippet : Decode.Decoder Snippet
decodeSnippet =
    Decode.map3 Snippet
        (Decode.field "channelId" Decode.string)
        (Decode.field "channelTitle" Decode.string)
        (Decode.field "title" Decode.string)


type alias Video =
    { id : VideoId
    , snippet : Snippet
    }


decodeVideo : Decode.Decoder Video
decodeVideo =
    Decode.map2 Video
        (Decode.at [ "id" ] decodeVideoId)
        (Decode.at [ "snippet" ] decodeSnippet)


type alias Youtube =
    { items : List Video
    }


decodeYoutube : Decode.Decoder Youtube
decodeYoutube =
    Decode.map Youtube
        (Decode.at [ "items" ] (Decode.list decodeVideo))


getVideos : String -> Http.Request Youtube
getVideos query =
    Http.get ("https://www.googleapis.com/youtube/v3/search?q=" ++ query ++ "&type=video&maxResults=5&part=snippet&key=") decodeYoutube
