module Request.Github exposing (errorToString, getReadme)

import Data.Session exposing (Session)
import Http exposing (Error(..))


errorToString : Http.Error -> String
errorToString error =
    case error of
        BadUrl url ->
            "Bad url: " ++ url

        Timeout ->
            "Request timed out."

        NetworkError ->
            "Network error. Are you online?"

        BadStatus status_code ->
            "HTTP error " ++ String.fromInt status_code

        BadBody body ->
            "Unable to parse response body: " ++ body


getReadme : Session -> (Result Error String -> msg) -> Cmd msg
getReadme session event =
    Http.get
        { url = "README.md"
        , expect = Http.expectString event
        }
