module Search.Requests exposing (playAlbum, playCmd, playTrack, playTrackCmd, search, searchCmdAlbum, searchCmdArtist, searchCmdTrack)

import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Search.Decoders
import Search.Encoders
import Types exposing (..)


token : String
token =
    "BQBdBOXxhFEDbcPNOCi4mONOj3hYM67203hfC9GalFKcWErMIzh_oZZa2qcsksUqggaHGLX-2KYGHWWgVLeEz8BrsNF9rvpRpWTvQLI-QTKkztdWKA1R_zy3FhcD5BJ5LrTI3sD0fMtC5-qAzgaCJxBEUX9oUhRd"



-- SEARCH


search : String -> String -> Decode.Decoder a -> Request a
search query type_ decoder =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/search?q=" ++ query ++ "&type=" ++ type_
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


searchCmdTrack : String -> String -> Cmd Msg
searchCmdTrack query type_ =
    Http.send FindTrack <| search query type_ Search.Decoders.decodeListTrack


searchCmdArtist : String -> String -> Cmd Msg
searchCmdArtist query type_ =
    Http.send FindArtist <| search query type_ Search.Decoders.decodeListArtist


searchCmdAlbum : String -> String -> Cmd Msg
searchCmdAlbum query type_ =
    Http.send FindAlbum <| search query type_ Search.Decoders.decodeListAlbum



-- PLAY


playCmd : String -> Cmd Msg
playCmd uri =
    Http.send Play <| playAlbum uri


playTrackCmd : List String -> Cmd Msg
playTrackCmd uris =
    Http.send PlayTrack <| playTrack uris


playAlbum : String -> Request ()
playAlbum uri =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (Search.Encoders.encodeAlbum uri)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


playTrack : List String -> Request ()
playTrack uris =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (Search.Encoders.encodeTrack uris)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
