module Request.Request exposing
    ( delete
    , get
    , getPaging
    , play
    , post
    , put
    )

import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


apiUrl : String
apiUrl =
    "https://api.spotify.com/v1/"


get : String -> String -> String -> Decode.Decoder a -> String -> Request a
get urlBefore id urlAfter decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = apiUrl ++ urlBefore ++ id ++ urlAfter
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


getPaging : String -> Decode.Decoder a -> String -> Request a
getPaging url decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = url
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


put : String -> String -> String -> String -> Request ()
put urlBefore e urlAfter token =
    request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = apiUrl ++ "me/player/" ++ urlBefore ++ e ++ urlAfter
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


post : String -> String -> String -> String -> Request ()
post urlBefore e urlAfter token =
    request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = apiUrl ++ urlBefore ++ e ++ urlAfter
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


delete : String -> String -> String -> Encode.Value -> String -> Request ()
delete urlBefore e urlAfter encoder token =
    request
        { method = "DELETE"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = apiUrl ++ urlBefore ++ e ++ urlAfter
        , body = Http.jsonBody encoder
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


play : a -> Encode.Value -> String -> Request ()
play e encoder token =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token ]
        , url = apiUrl ++ "me/player/play"
        , body = Http.jsonBody encoder
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
