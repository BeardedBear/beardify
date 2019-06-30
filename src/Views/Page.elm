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
        [ div [ class "app" ]
            [ Views.Sidebar.view config.session
            , div [ class "content" ]
                [ div [ class "topbar" ] [ search ]
                , div [ class "drawer" ] content
                , player
                ]
            ]
        ]
    }
