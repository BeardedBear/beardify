module Views.Page exposing (Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Notif, Session)
import Html exposing (..)
import Html.Attributes exposing (class)
import Views.Notif as Notif


type alias Config msg =
    { session : Session
    , clearNotification : Notif -> msg
    }


frame : Config msg -> ( String, List (Html msg) ) -> Document msg
frame { session, clearNotification } ( title, content ) =
    { title = title ++ " | Beardify "
    , body =
        [ Notif.component
            { clear = clearNotification
            , notifs = session.notifications
            }
        , main_ [ class "App" ] content
        ]
    }
