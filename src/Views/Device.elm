module Views.Device exposing (view)

import Data.Device as Device exposing (Device)
import Html exposing (..)
import Html.Attributes exposing (..)


type alias Config =
    { devices : List Device }


head : Html msg
head =
    div [ class "DeviceListHead" ]
        [ div []
            [ i [ class "DeviceListHead__icon1 icon-smartphone" ] []
            , i [ class "DeviceListHead__icon2 icon-computer" ] []
            , i [ class "DeviceListHead__icon3 icon-speaker" ] []
            ]
        , text "Choose the device on which to play your music"
        ]


item : Device -> Html msg
item device =
    div
        [ classList
            [ ( "DeviceList__item", True )
            , ( "active", device.active )
            ]
        ]
        [ div [ class "DeviceList__icon" ] [ i [ class ("icon-" ++ Device.typeToString device.type_) ] [] ]
        , div []
            [ div [ class "Device__name" ] [ text device.name ]
            , div [ class "Device__id" ] []
            ]
        ]


view : Config -> Html msg
view config =
    div [ class "Device" ]
        [ div [ class "Device__select" ]
            [ i [ class "Device__active icon-computer" ] []
            , List.map item config.devices
                |> List.append [ head ]
                |> div [ class "DeviceList" ]
            ]
        , div [ class "Device__volume" ] [ i [ class "icon-sound" ] [], input [ type_ "range" ] [] ]
        ]
