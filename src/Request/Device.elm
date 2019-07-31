module Request.Device exposing (get, set)

import Data.Device exposing (Device, Id, decode, idToString)
import Data.Session exposing (Session)
import Http exposing (Request)
import Json.Decode as Decode
import Json.Encode as Encode
import Request exposing (get)
import Task exposing (Task)


get : Session -> Task Http.Error (List Device)
get session =
    Request.get
        "me/player/devices"
        ""
        ""
        (decode
            |> Decode.list
            |> Decode.at [ "devices" ]
        )
        session.token
        |> Http.toTask


set : Session -> Id -> Task Http.Error ()
set session deviceId =
    let
        encodeDevice =
            Encode.object
                [ ( "device_ids", Encode.list Encode.string [ deviceId |> idToString ] )
                ]
    in
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ session.token
            ]
        , url = "https://api.spotify.com/v1/me/player"
        , body = Http.jsonBody encodeDevice
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.toTask
