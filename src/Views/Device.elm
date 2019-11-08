module Views.Device exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Device" ]
        [ div [ class "Device__select" ]
            [ i [ class "Device__active icon-computer" ] []
            , div [ class "DeviceList" ]
                [ div [ class "DeviceListHead" ]
                    [ div []
                        [ i [ class "DeviceListHead__icon1 icon-smartphone" ] []
                        , i [ class "DeviceListHead__icon2 icon-computer" ] []
                        , i [ class "DeviceListHead__icon3 icon-speaker" ] []
                        ]
                    , text "Choose the device on which to play your music"
                    ]
                , div [ class "DeviceList__item active" ]
                    [ div [ class "DeviceList__icon" ] [ i [ class "icon-computer" ] [] ]
                    , div []
                        [ div [ class "Device__name" ] [ text "Machin" ]
                        , div [ class "Device__id" ] [ text "DellXPS 15" ]
                        ]
                    ]
                , div [ class "DeviceList__item" ]
                    [ div [ class "DeviceList__icon" ] [ i [ class "icon-speaker" ] [] ]
                    , div []
                        [ div [ class "Device__name" ] [ text "Machin" ]
                        , div [ class "Device__id" ] [ text "DellXPS 15" ]
                        ]
                    ]
                ]
            ]
        , div [ class "DeviceVolume" ]
            [ i [ class "DeviceVolume__icon icon-sound" ] []
            , input [ class "Range", type_ "range" ] []
            ]
        ]
