module Data.Session exposing
    ( Session
    , Store
    , deserializeStore
    , serializeStore
    )

import Browser.Navigation as Nav
import Data.Authorization as Authorization exposing (Authorization)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


type alias Session =
    { navKey : Nav.Key
    , clientUrl : String
    , authUrl : String
    , clientId : String
    , state : String
    , store : Store
    }


{-| A serializable data structure holding session information you want to share
across browser restarts, typically in localStorage.
-}
type alias Store =
    { auth : Maybe Authorization }


defaultStore : Store
defaultStore =
    { auth = Nothing }


decodeStore : Decoder Store
decodeStore =
    Decode.map Store
        (Decode.field "auth" Authorization.decode |> Decode.maybe)


encodeStore : Store -> Encode.Value
encodeStore v =
    Encode.object
        [ ( "auth"
          , v.auth
                |> Maybe.map Authorization.encode
                |> Maybe.withDefault Encode.null
          )
        ]


deserializeStore : String -> Store
deserializeStore =
    Decode.decodeString decodeStore >> Result.withDefault defaultStore


serializeStore : Store -> String
serializeStore =
    encodeStore >> Encode.encode 0
