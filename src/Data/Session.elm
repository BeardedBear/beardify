module Data.Session exposing
    ( Notif(..)
    , Session
    , Store
    , closeNotification
    , decodeStore
    , defaultStore
    , deserializeStore
    , encodeStore
    , notificationTick
    , notifyError
    , notifyInfo
    , notifySuccess
    , serializeStore
    , tickNotifications
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
    , notifications : List Notif
    }


type Notif
    = ErrorNotif String String
    | InfoNotif Float String
    | SuccessNotif Float String


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



-- Notifications


notificationTick : Float
notificationTick =
    250


closeNotification : Notif -> Session -> Session
closeNotification notif session =
    { session | notifications = session.notifications |> List.filter ((/=) notif) }


notifyError : String -> String -> Session -> Session
notifyError title message session =
    { session | notifications = ErrorNotif title message :: session.notifications }


notifyInfo : String -> Session -> Session
notifyInfo message session =
    { session | notifications = InfoNotif 0 message :: session.notifications }


notifySuccess : String -> Session -> Session
notifySuccess message session =
    { session | notifications = SuccessNotif 0 message :: session.notifications }


tickNotifications : Float -> Session -> Session
tickNotifications tick session =
    let
        bump notif =
            case notif of
                SuccessNotif previous message ->
                    SuccessNotif (previous + tick) message

                InfoNotif previous message ->
                    InfoNotif (previous + tick) message

                _ ->
                    notif

        keep notif =
            case notif of
                ErrorNotif _ _ ->
                    True

                InfoNotif elapsed _ ->
                    elapsed < 3000

                SuccessNotif elapsed _ ->
                    elapsed < 3000
    in
    { session
        | notifications =
            session.notifications
                |> List.map bump
                |> List.filter keep
    }
