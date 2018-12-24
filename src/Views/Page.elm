module Views.Page exposing (ActivePage(..), Config, frame)

-- import Views.Sidebar

import Browser exposing (Document)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (class, classList, css, href, src)
import Route
import Utils
import Views.Meta
import Views.Player
import Views.Search
import Views.Theme


type ActivePage
    = Home
    | Counter
    | Collection
    | Playlist
    | Album
    | Artist
    | Other


type alias Config =
    { session : Data.Session.Session
    , activePage : ActivePage
    }


frame : Config -> Html msg -> ( String, List (Html msg) ) -> Document msg
frame config player ( title, content ) =
    { title = title ++ " - Beardify"
    , body =
        [ div [ class "app" ]
            [ Views.Theme.defaultCss
            , sidebarView config
            , div [ class "content" ]
                [ div [ class "topbar" ] [ Views.Search.view config.session.search ]
                , div [ class "drawer" ] content
                , player
                ]
            ]
            |> toUnstyled
        ]
    }


collectionView : Data.Session.Session -> List PlaylistSimplified -> Bool -> Bool -> Html msg
collectionView session playlists isClickable hasTitle =
    let
        -- _ =
        --     Debug.log "route" playlists
        collectionItem p =
            a
                [ classList
                    [ ( "playlist", True )
                    , ( "active", Utils.getId session.url == p.id )
                    ]
                , Route.href <| Route.Collection p.id
                ]
                [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" p.name ]
    in
    if List.length playlists /= 0 then
        div [ class "collections" ]
            [ if hasTitle then
                div [ class "title" ] [ text "Collections" ]

              else
                text ""
            , playlists
                |> List.filter (\f -> String.contains "#Collection" f.name)
                |> List.map collectionItem
                |> div [ class "playlists-list" ]
            ]

    else
        text ""


playlistView : Data.Session.Session -> List PlaylistSimplified -> Bool -> Html msg
playlistView session playlists isClickable =
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
    let
        _ =
            Debug.log "activePage" config.session.navKey

        linkIf page route caption icon =
            if page == config.activePage then
                span [ class "menu-item active" ] [ i [ class icon ] [], text caption ]

            else
                a [ class "menu-item", Route.href route ] [ i [ class icon ] [], text caption ]
    in
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
        , div [ class "top-menu" ]
            [ linkIf Home Route.Home "Home" "icon-home"
            , linkIf Counter Route.Counter "Second page" "icon-bell"
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ collectionView config.session config.session.playlists True True
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , playlistView config.session config.session.playlists True
                    ]
                ]
            ]
        ]
