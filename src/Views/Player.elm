module Views.Player exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Player" ]
        [ div [ class "Player__controls" ]
            [ button [] [ i [ class "icon-play" ] [] ]
            , button [] [ i [ class "icon-to-start" ] [] ]
            , button [] [ i [ class "icon-to-end" ] [] ]
            ]
        , div [ class "PlayerCurrent" ]
            [ img [ class "PlayerCurrent__cover", src "https://i.scdn.co/image/ab67616d0000b273d10a2159dc6ef7beb9ef098e" ] []
            , div [ class "PlayerCurrent__controls" ]
                [ div []
                    [ span [ class "PlayerCurrent__song" ] [ text "The Proving Grounds" ]
                    , span [] [ text " - " ]
                    , a [ href "", class "Artist__link" ] [ text "Mars Red Sky" ]
                    ]
                , input [ class "PlayerCurrent__range", type_ "range" ] []
                ]
            ]
        ]
