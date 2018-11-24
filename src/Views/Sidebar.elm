module Views.Sidebar exposing (view)

import Browser exposing (Document)
import Css exposing (..)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, classList, css, href, src)
import Route
import Views.Root as Root exposing (..)
import Views.Theme exposing (Element, defaultCss)


viewCollections : List PlaylistSimplified -> Bool -> Bool -> Html msg
viewCollections playlists isClickable hasTitle =
    let
        collectionItem p =
            a
                [ classList [ ( "playlist", True ) ]
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


viewPlaylists : List PlaylistSimplified -> Bool -> Html msg
viewPlaylists playlists isClickable =
    let
        test =
            playlists
                |> List.filter (\f -> not <| String.contains "#Collection" f.name)
    in
    test
        |> List.map
            (\title ->
                div
                    [ classList [ ( "playlist", True ) ] ]
                    [ i [ class "icon-list" ] [], text title.name ]
            )
        |> div [ class "playlists-list" ]


view : Root.Config -> Html msg
view { activePage, session } =
    let
        linkIf page route caption icon =
            if page == activePage then
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
                [ viewCollections session.playlists True True
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists session.playlists True
                    ]
                ]
            ]
        ]
