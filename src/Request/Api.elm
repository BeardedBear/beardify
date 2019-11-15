module Request.Api exposing
    ( authHeader
    , jsonResolver
    , mapError
    , url
    , valueResolver
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


formatDecodingError : Decode.Error -> String
formatDecodingError =
    -- TODO: ideally we could parse and format very accurately decode error messages.
    -- see https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#Error
    Decode.errorToString
        >> String.replace "\\n" "\n"
        >> String.replace "\\\"" "\""
        >> String.replace "    " "  "


jsonResolver : Decoder a -> Http.Resolver Http.Error a
jsonResolver decoder =
    Http.stringResolver
        (toResult
            >> Result.andThen
                (Decode.decodeString decoder
                    >> Result.mapError (formatDecodingError >> Http.BadBody)
                )
        )


processResponse : (Metadata -> String -> a) -> Response String -> Result Http.Error a
processResponse process res =
    case res of
        Http.BadUrl_ url_ ->
            Err (Http.BadUrl url_)

        Http.Timeout_ ->
            Err Http.Timeout

        Http.BadStatus_ { statusCode } _ ->
            Err (Http.BadStatus statusCode)

        Http.NetworkError_ ->
            Err Http.NetworkError

        Http.GoodStatus_ metadata body ->
            Ok (process metadata body)


mapError : Session -> Task Error a -> Task ( Session, Http.Error ) a
mapError session task =
    task
        |> Task.mapError
            (\httpError ->
                case httpError of
                    BadStatus status ->
                        if status == 401 then
                            ( Session.updateAuth Nothing session
                                |> Session.notifyError "Session expired!" "you will be redirected on login page!"
                            , httpError
                            )

                        else
                            ( session, httpError )

                    _ ->
                        ( session, httpError )
            )


toResult : Response String -> Result Error String
toResult =
    processResponse (\_ body -> body)


url : String
url =
    "https://api.spotify.com/" ++ version ++ "/"


valueResolver : a -> Http.Resolver Http.Error a
valueResolver value =
    Http.stringResolver (toResult >> Result.map (always value))


version : String
version =
    "v1"
