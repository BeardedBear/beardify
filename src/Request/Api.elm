module Request.Api exposing (handleJsonResponse, url)

import Data.Spotify as Spotify
import Http exposing (..)
import Json.Decode as Decode exposing (Decoder)


url : String
url =
    "https://api.spotify.com/" ++ version ++ "/"


version : String
version =
    "v1"


handleJsonResponse : Decoder a -> Http.Response String -> Result Http.Error a
handleJsonResponse decoder response =
    case response of
        Http.BadUrl_ url_ ->
            Err (Http.BadUrl url_)

        Http.Timeout_ ->
            Err Http.Timeout

        Http.BadStatus_ { statusCode } _ ->
            Err (Http.BadStatus statusCode)

        Http.NetworkError_ ->
            Err Http.NetworkError

        Http.GoodStatus_ _ body ->
            case Decode.decodeString decoder body of
                Err _ ->
                    Err (Http.BadBody body)

                Ok result ->
                    Ok result
