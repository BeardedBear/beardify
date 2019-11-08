module Request.Device exposing (getList)

import Data.Authorization as Authorization
import Data.Device as Device exposing (Device)
import Data.Session exposing (Session)
import Http exposing (..)
import Json.Decode as Decode exposing (Decoder)
import Request.Api as Api
import Task exposing (Task)


getList : Session -> Task Http.Error (List Device)
getList session =
    let
        authHeader =
            Maybe.andThen Authorization.createAuthHeader session.store.auth
                |> Maybe.withDefault ""
                |> Http.header "Authorization"
    in
    Http.task
        { method = "GET"
        , headers = [ authHeader ]
        , url = Api.url ++ "me/player/devices"
        , body = Http.emptyBody
        , resolver =
            Decode.at [ "devices" ] (Decode.list Device.decode)
                |> Api.handleJsonResponse
                |> Http.stringResolver
        , timeout = Nothing
        }
