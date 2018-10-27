module View.Modal exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)
import View.Sidebar exposing (..)


view : Root.Model -> Html Msg
view model =
    if model.modal.isOpen then
        div []
            [ div [ class "overlay" ] []
            , div [ class "modal" ]
                [ div [ class "head" ]
                    [ div [ class "title" ] [ text "Add in a collection" ]
                    ]
                , div [ class "chest" ]
                    [ viewCollections model.drawer model.playlists False
                    ]
                , div [ class "foot" ]
                    [ button [ class "button", onClick ModalClear ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        text ""
