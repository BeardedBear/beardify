module Views.Player exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Player" ]
        [ div [ class "PlayerControl" ]
            [ button [ class "PlayerControl__btn play" ] [ i [ class "icon-play" ] [] ]
            , button [ class "PlayerControl__btn" ] [ i [ class "icon-to-start" ] [] ]
            , button [ class "PlayerControl__btn" ] [ i [ class "icon-to-end" ] [] ]
            ]
        , div [ class "PlayerCurrent" ]
            [ img [ class "PlayerCurrent__cover", src "https://i.scdn.co/image/ab67616d0000b273d10a2159dc6ef7beb9ef098e" ] []
            , div [ class "PlayerCurrent__control" ]
                [ div []
                    [ span [ class "PlayerCurrent__song" ] [ text "The Proving Grounds" ]
                    , span [] [ text " - " ]
                    , a [ href "", class "Artist__link" ] [ text "Mars Red Sky" ]
                    ]
                , div [ class "PlayerCurrent__bar" ]
                    [ span [ class "PlayerCurrent__time" ] [ text "2:33" ]
                    , input [ class "Range", type_ "range" ] []
                    , span [ class "PlayerCurrent__time" ] [ text "2:33" ]
                    ]
                ]
            ]
        ]
