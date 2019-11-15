module Views.Page exposing (Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Notif, Session)
import Html exposing (..)
import Html.Attributes exposing (class)
import Views.Device as Device
import Views.Notif as Notif
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


type alias Config msg =
    { session : Session
    , clearNotification : Notif -> msg
    , playerMsg : Player.Msg -> msg
    , deviceMsg : Device.Msg -> msg
    }


frame : Config msg -> ( String, List (Html msg) ) -> Document msg
frame { session, clearNotification, playerMsg, deviceMsg } ( title, content ) =
    { title = title ++ " | Beardify "
    , body =
        [ Notif.component
            { clear = clearNotification
            , notifs = session.notifications
            }
        , case session.store.auth of
            Just _ ->
                main_ [ class "App" ]
                    [ Topbar.view session
                    , div [ class "App__body" ]
                        [ Sidebar.view
                        , div [ class "Content" ]
                            [ div [ class "Page HelperScrollArea" ] content
                            , div [ class "Content__bottom" ]
                                [ Player.view session.playerContext
                                    |> Html.map playerMsg
                                , Device.view session.devices
                                    |> Html.map deviceMsg
                                ]
                            ]
                        ]
                    ]

            Nothing ->
                main_ [ class "App" ] content
        ]
    }
