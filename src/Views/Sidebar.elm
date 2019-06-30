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


playlistItem : Session -> PlaylistType -> PlaylistSimplified -> Html msg
playlistItem session playlistType playlist =
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


listFilter : PlaylistType -> List PlaylistSimplified -> List PlaylistSimplified
listFilter playlistType list =
    case playlistType of
        Albums ->
            list
                |> List.filter (\playlist -> String.contains "#Collection" playlist.name)

        Tracks ->
            list
                |> List.filter (\playlist -> not <| String.contains "#Collection" playlist.name)


playlistList : Session -> PlaylistType -> List PlaylistSimplified -> Html msg
playlistList session playlistType playlists =
    if List.length playlists /= 0 then
        div [ class "playlists" ]
            [ div [ class "title" ] [ text "Playlists" ]
            , playlists
                |> listFilter playlistType
                |> List.map (playlistItem session playlistType)
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
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ playlistList session Albums session.playlists
                , playlistList session Tracks session.playlists
                ]
            ]
        ]
