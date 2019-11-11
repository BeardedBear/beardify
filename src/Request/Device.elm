module Request.Device exposing (getList, set)

import Data.Authorization as Authorization
import Data.Device as Device exposing (Device)
import Data.Session exposing (Session)
import Http exposing (..)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Request.Api as Api
import Task exposing (Task)


getList : Session -> Task Http.Error (List Device)
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


set : Session -> Device -> Task Http.Error ()
set session device =
    Http.task
        { method = "PUT"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player"
        , timeout = Nothing
        , body =
            jsonBody
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
