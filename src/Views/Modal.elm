module View.Modal exposing (view)

import Data.Session
import Html.Styled exposing (div)
import Html.Styled.Attributes exposing (class)
import Views.Sidebar


view : Data.Session.Session -> Html msg
view session =
    if session.modal.isOpen then
        div []
            [ div [ class "overlay" ] []
            , div [ class "modal" ]
                [ div [ class "head" ]
                    [ div [ class "title" ] [ text "Add in a collection" ]
                    ]
                , div [ class "chest" ]
                    [ Views.Sidebar.viewCollections model.drawer model.playlists False False
                    ]
                , div [ class "foot" ]
                    [ button [ class "button" ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        text ""
