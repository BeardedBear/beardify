module Views.Sidebar exposing (view)

import Browser exposing (Document)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, classList, css, href, src)
import Route
import Utils
import Views.Meta


viewCollections : Data.Session.Session -> List PlaylistSimplified -> Bool -> Bool -> Html msg
viewCollections session playlists _ hasTitle =
    let
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
    let
        _ =
            Debug.log "activePage" session.navKey

        linkIf page route caption icon =
            if page == session.activePage then
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
            [ linkIf Views.Page.Home Route.Home "Home" "icon-home"
            , linkIf Views.Page.Counter Route.Counter "Second page" "icon-bell"
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ viewCollections session session.playlists True True
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists session session.playlists True
                    ]
                ]
            ]
        ]
