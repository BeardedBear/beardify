module Request.Player exposing (get, play)

import Data.Player as Player exposing (Player)
import Data.Session exposing (Session)
import Http
import Json.Decode as Decode
import Request.Api as Api
import Task exposing (Task)


get : Session -> Task ( Session, Http.Error ) Player
get session =
    Http.task
        { method = "GET"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player"
        , body = Http.emptyBody
        , resolver =
            Player.decode
                |> Api.handleJsonResponse
                |> Http.stringResolver
        , timeout = Nothing
        }
        |> Api.mapError session


play : Session -> Task ( Session, Http.Error ) ()
play session =
    Http.task
        { method = "Put"
        , headers = [ Api.authHeader session ]
        , url = Api.url ++ "me/player/play"
        , body = Http.emptyBody
        , resolver =
            Decode.succeed ()
                |> Api.handleJsonResponse
                |> Http.stringResolver
        , timeout = Nothing
        }
        |> Api.mapError session
