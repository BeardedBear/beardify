module Data.Youtube exposing
    ( Snippet
    , Video
    , Youtube
    , decodeSnippet
    , decodeVideo
    , decodeYoutube
    , getVideos
    )

import Http exposing (get)
import Json.Decode as Decode exposing (Decoder(..), at, field)


type alias VideoId =
    String


decodeVideoId : Decode.Decoder VideoId
decodeVideoId =
    Decode.field "videoId" Decode.string


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
    List Video


decodeYoutube : Decode.Decoder Youtube
decodeYoutube =
    Decode.at [ "items" ] (Decode.list decodeVideo)


getVideos : String -> Http.Request Youtube
getVideos query =
    Http.get ("https://www.googleapis.com/youtube/v3/search?q=" ++ query ++ "&type=video&maxResults=4&part=snippet&key=AIzaSyDjlO4Gb0jCsxrot8KcNslXNSN_cIN5yqs") decodeYoutube
