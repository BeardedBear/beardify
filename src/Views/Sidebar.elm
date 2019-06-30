module Views.Sidebar exposing (view)

import Data.Playlist exposing (PlaylistSimplified)
import Data.Session exposing (Session)
import Html exposing (Html, a, div, i, img, span, text)
import Html.Attributes exposing (class, classList, href, src)
import Route
import Utils


type PlaylistType
    = Tracks
    | Albums


collectionItem : Session -> PlaylistType -> PlaylistSimplified -> Html msg
collectionItem session playlistType playlist =
    let
        classes =
            classList
                [ ( "playlist", True )
                , ( "active", Utils.getId session.url == playlist.id )
                ]
    in
    case playlistType of
        Albums ->
            a
                [ classes, Route.href <| Route.Collection playlist.id ]
                [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" playlist.name ]

        Tracks ->
            a
                [ classes, Route.href <| Route.Playlist playlist.id ]
                [ i [ class "icon-list" ] [], text playlist.name ]


collectionList : Session -> List PlaylistSimplified -> Html msg
collectionList session playlists =
    if List.length playlists /= 0 then
        div [ class "collections" ]
            [ div [ class "title" ] [ text "Collections" ]
            , playlists
                |> List.filter (\playlist -> String.contains "#Collection" playlist.name)
                |> List.map (collectionItem session Albums)
                |> div [ class "playlists-list" ]
            ]

    else
        text ""


playlistList : Session -> List PlaylistSimplified -> Html msg
playlistList session playlists =
    if List.length playlists /= 0 then
        div [ class "playlists" ]
            [ div [ class "title" ] [ text "Playlists" ]
            , playlists
                |> List.filter (\playlist -> not <| String.contains "#Collection" playlist.name)
                |> List.map (collectionItem session Tracks)
                |> div [ class "playlists-list" ]
            ]

    else
        text ""


view : Session -> Html msg
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
                [ collectionList session session.playlists
                , playlistList session session.playlists
                ]
            ]
        ]
