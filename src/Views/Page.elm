module Views.Page exposing (Config, frame)

import Browser exposing (Document)
import Data.Device exposing (Device)
import Data.Player exposing (PlayerContext)
import Data.Session exposing (Notif, Session)
import Html exposing (..)
import Html.Attributes exposing (class)
import Views.Device as Device
import Views.Modal as Modal
import Views.Notif as Notif
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


type alias Config msg =
    { session : Session
    , clearNotification : Notif -> msg
    , playerMsg : Player.Msg -> msg
    , deviceMsg : Device.Msg -> msg
    , player : PlayerContext
    , devices : List Device
    }


frame : Config msg -> ( String, List (Html msg) ) -> Document msg
frame { session, clearNotification, playerMsg, deviceMsg, player, devices } ( title, content ) =
    { title = title ++ " | Beardify "
    , body =
        [ Notif.component
            { clear = clearNotification
            , notifs = session.notifications
            }

        -- , Modal.view
        , case session.store.auth of
            Just _ ->
                main_ [ class "App" ]
                    [ Topbar.view session
                    , div [ class "App__body" ]
                        [ Sidebar.view
                        , div [ class "Content" ]
                            [ div [ class "Page HelperScrollArea" ] content
                            , div [ class "Content__bottom" ]
                                [ Player.view player
                                    |> Html.map playerMsg
                                , Device.view devices
                                    |> Html.map deviceMsg
                                ]
                            ]
                        ]
                    ]

            Nothing ->
                main_ [ class "App" ] content
        ]
    }
