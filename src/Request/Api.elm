module Request.Api exposing
    ( authHeader
    , handleJsonResponse
    , mapError
    , url
    )

import Data.Authorization as Authorization
import Data.Session as Session exposing (Session)
import Http exposing (..)
import Json.Decode as Decode exposing (Decoder)
import Task exposing (Task)


authHeader : Session -> Http.Header
authHeader session =
    Maybe.andThen Authorization.createAuthHeader session.store.auth
        |> Maybe.withDefault ""
        |> Http.header "Authorization"


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


mapError : Session -> Task Error a -> Task ( Session, Http.Error ) a
mapError session task =
    task
        |> Task.mapError
            (\httpError ->
                case httpError of
                    BadStatus status ->
                        if status == 401 then
                            ( Session.updateAuth Nothing session
                                |> Session.notifyError "Session expired!" "You will be redirect on login page !"
                            , httpError
                            )

                        else
                            ( session, httpError )

                    _ ->
                        ( session, httpError )
            )


url : String
url =
    "https://api.spotify.com/" ++ version ++ "/"


version : String
version =
    "v1"
