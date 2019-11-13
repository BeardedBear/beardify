module Views.Notif exposing (Config, component, notificationItem)

import Data.Session exposing (Notif(..))
import Html exposing (..)
import Html.Attributes as HA exposing (..)
import Html.Events exposing (onClick)
import Route


type alias Config msg =
    { notifs : List Notif
    , clear : Notif -> msg
    }


notificationItem : Config msg -> Notif -> Html msg
notificationItem { clear } notif =
    case notif of
        ErrorNotif title message ->
            div [ class "Notif__item danger" ]
                [ h3 [ class "NotifItem__title" ] [ text title ]
                , p [ class "Notif__desc" ] [ text message ]
                , div [ class "Notif__actions" ]
                    [ button [ class "Button Notif__btn", onClick (clear notif) ] [ text "Close" ]
                    ]
                ]

        InfoNotif _ message ->
            div [ class "Notif__item info" ]
                [ p [ class "Notif__desc" ] [ text message ]
                , div [ class "Notif__actions" ]
                    [ button [ class "Button Notif__btn", onClick (clear notif) ] [ text "Close" ]
                    ]
                ]

        SuccessNotif _ message ->
            div [ class "Notif__item NotifItem success" ]
                [ button [ class "NotifItemButton close", onClick (clear notif) ] []
                , text message
                , div [ class "Notif__actions" ]
                    [ button [ class "Button Notif__btn", onClick (clear notif) ] [ text "Close" ]
                    ]
                ]


component : Config msg -> Html msg
component ({ notifs } as config) =
    notifs
        |> List.map (notificationItem config)
        |> div [ class "Notif" ]
