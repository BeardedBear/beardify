module Views.Page exposing (ActivePage(..), Config, frame)

-- import Views.Sidebar

import Browser exposing (Document)
import Data.Playlist exposing (PlaylistSimplified)
import Data.Session exposing (Session)
import Html exposing (Html, a, div, i, img, span, text)
import Html.Attributes exposing (class, classList, href, src)
import Route
import Utils
import Views.Collection


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
    { title = title ++ " - Beardify"
    , body =
        [ div [ class "app" ]
            [ sidebarView config
            , div [ class "content" ]
                [ div [ class "topbar" ] [ search ]
                , div [ class "drawer" ] content
                , player
                ]
            ]
        ]
    }


playlistView : Session -> List PlaylistSimplified -> Bool -> Html msg
playlistView session playlists _ =
    let
        test =
            playlists
                |> List.filter (\f -> not <| String.contains "#Collection" f.name)
    in
    test
        |> List.map
            (\title ->
                a
                    [ classList
                        [ ( "playlist", True )
                        , ( "active", Utils.getId session.url == title.id )
                        ]
                    , Route.href <| Route.Playlist title.id
                    ]
                    [ i [ class "icon-list" ] [], text title.name ]
            )
        |> div [ class "playlists-list" ]


sidebarView : Config -> Html msg
sidebarView config =
    div [ class "sidebar" ]
        [ div [ class "logo" ]
            [ img [ src "./img/logo.png" ] []
            , text "Beardify"
            , span [] [ text " alpha" ]
            , div [ class "help" ]
                [ i [ class "icon-question" ] []
                , div [ class "popup" ]
                    [ div [ class "title" ] [ text "Raccourcis" ]
                    , div [] [ text "SHIFT + F : Focus search bar" ]
                    , div [] [ text "SPACEBAR : Play/Pause player" ]
                    ]
                ]
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ Views.Collection.view
                    { session = config.session
                    , playlists = config.session.playlists
                    , hasTitle = True
                    }
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , playlistView config.session config.session.playlists True
                    ]
                ]
            ]
        ]
