module Views.Page exposing (ActivePage(..), Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (Html, div)
import Html.Attributes exposing (class)
import Views.Sidebar


type ActivePage
    = Home
    | Counter
    | Collection
    | Playlist
    | Album
    | Artist
    | Other


type alias Config =
    { session : Session
    , activePage : ActivePage
    }


frame : Config -> Html msg -> Html msg -> ( String, List (Html msg) ) -> Document msg
frame config player search ( title, content ) =
    { title = title
    , body =
        [ div [ class "App" ]
            [ Views.Sidebar.view config.session
            , div [ class "App__content" ]
                [ div [ class "Topbar" ] [ search ]
                , div [ class "drawer" ] content
                , player
                ]
            ]
        ]
    }
