module Request.Device exposing (getList, set, setVolume)

import Data.Device as Device exposing (Device)
import Data.Session exposing (Session)
import Http exposing (task)
import Json.Decode as Decode
import Json.Encode as Encode
import Request.Api as Api
import Task exposing (Task)


getList : Session -> Task ( Session, Http.Error ) (List Device)
getList session =
    Http.task
        { method = "GET"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player/devices"
        , body = Http.emptyBody
        , resolver =
            Decode.at [ "devices" ] (Decode.list Device.decode)
                |> Api.handleJsonResponse
                |> Http.stringResolver
        , timeout = Nothing
        }
        |> Api.mapError session


set : Session -> Device -> Task ( Session, Http.Error ) ()
set session device =
    Http.task
        { method = "PUT"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player"
        , timeout = Nothing
        , body =
            Http.jsonBody
                (Encode.object
                    [ ( "device_ids"
                      , Encode.list Encode.string
                            [ Device.idToString device.id ]
                      )
                    ]
                )
        , resolver =
            Decode.succeed ()
                |> Api.handleJsonResponse
                |> Http.stringResolver
        }
        |> Api.mapError session


setVolume : Session -> Int -> Task ( Session, Http.Error ) ()
setVolume session volume =
    Http.task
        { method = "PUT"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player/volume?volume_percent=" ++ String.fromInt volume
        , timeout = Nothing
        , body = Http.emptyBody
        , resolver =
            Decode.succeed ()
                |> Api.handleJsonResponse
                |> Http.stringResolver
        }
        |> Api.mapError session
