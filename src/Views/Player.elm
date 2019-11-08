module Views.Player exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Player" ]
        [ div [ class "Player__controls" ]
            [ button [] [ text ">>" ]
            , button [] [ text ">|" ]
            , button [] [ text "|<" ]
            ]
        , div [ class "PlayerCurrent" ]
            [ img [ class "PlayerCurrent__cover", src "https://i.scdn.co/image/ab67616d0000b273d10a2159dc6ef7beb9ef098e" ] []
            , div []
                [ div []
                    [ span [ class "PlayerCurrent__song" ] [ text "The Proving Grounds" ]
                    , span [ class "PlayerCurrent__artist" ] [ text "Mars Red Sky" ]
                    ]
                , input [ class "PlayerCurrent__range", type_ "range" ] []
                ]
            ]
        , div [ class "Player__device" ] [ text "device" ]
        , div [ class "Player__volume" ] [ text "volume" ]
        ]
