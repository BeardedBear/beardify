module Data.Session exposing
    ( Session
    , Store
    , deserializeStore
    , serializeStore
    , updateAuth
    , updateState
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
    , randomBytes : String
    , store : Store
    }


{-| A serializable data structure holding session information you want to share
across browser restarts, typically in localStorage.
-}
type alias Store =
    { auth : Maybe Authorization
    , state : String
    }


updateState : String -> Session -> Session
updateState newState ({ store } as session) =
    { session | store = { store | state = newState } }


updateAuth : Maybe Authorization -> Session -> Session
updateAuth auth ({ store } as session) =
    { session | store = { store | auth = auth } }


defaultStore : Store
defaultStore =
    { auth = Nothing
    , state = ""
    }


decodeStore : Decoder Store
decodeStore =
    Decode.map2 Store
        (Decode.field "auth" Authorization.decode |> Decode.maybe)
        (Decode.field "state" Decode.string)


encodeStore : Store -> Encode.Value
encodeStore v =
    Encode.object
        [ ( "auth"
          , v.auth
                |> Maybe.map Authorization.encode
                |> Maybe.withDefault Encode.null
          )
        , ( "state", Encode.string v.state )
        ]


deserializeStore : String -> Store
deserializeStore =
    Decode.decodeString decodeStore >> Result.withDefault defaultStore


serializeStore : Store -> String
serializeStore =
    encodeStore >> Encode.encode 0
