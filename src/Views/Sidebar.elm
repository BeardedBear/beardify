module Views.Sidebar exposing (view)

import Browser exposing (Document)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class, classList, href, src)
import Route
import Utils
import Views.Collection


viewPlaylists : Data.Session.Session -> List PlaylistSimplified -> Bool -> Html msg
viewPlaylists session playlists isClickable =
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


view : Data.Session.Session -> Html msg
view session =
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
                    { session = session
                    , playlists = session.playlists
                    , hasTitle = True
                    }
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists session session.playlists True
                    ]
                ]
            ]
        ]
