module Views.Modal exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Modal" ]
        [ div [ class "Modal__form" ]
            [ div [ class "Modal__head" ]
                [ h2 [ class "Modal__title Heading" ] [ text "Faire des machins" ]
                , button [ class "Button nude" ] [ i [ class "icon-close" ] [] ]
                ]
            , div [ class "Modal__body " ]
                [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris neque tortor, vulputate rhoncus quam sit amet, cursus accumsan ex. Suspendisse aliquam sapien sapien, quis dapibus arcu cursus dictum. Donec faucibus sit amet diam vel aliquam. Praesent purus dolor, malesuada quis ex vel, pulvinar blandit dui."
                ]
            , div [ class "Modal__foot" ]
                [ button [ class "Button" ] [ text "Cancel" ]
                , button [ class "Button primary" ] [ text "Accept" ]
                ]
            ]
        ]
