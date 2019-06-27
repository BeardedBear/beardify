module Views.Modal exposing (view)

import Data.Session
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (class)
import Html.Styled.Events exposing (..)
import Views.Sidebar


type Msg
    = NoOp


type alias Config msg =
    { isOpen : Bool
    , session : Data.Session.Session
    , close : msg
    }


view : Config msg -> Html msg
view ({ session } as config) =
    if config.isOpen then
        div []
            [ div [ class "overlay" ] []
            , div [ class "modal" ]
                [ div [ class "head" ]
                    [ div [ class "title" ] [ text "Add in a collection" ]
                    ]
                , div [ class "chest" ]
                    [ Views.Sidebar.viewCollections
                        { session = config.session
                        , playlists = session.playlists
                        , hasTitle = False
                        }
                    ]
                , div [ class "foot" ]
                    [ button [ class "button", onClick config.close ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        text ""
