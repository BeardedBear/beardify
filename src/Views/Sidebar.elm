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


type alias Config =
    { session : Session
    , playlistType : PlaylistType
    , playlists : List PlaylistSimplified
    , label : String
    }


playlistItem : Session -> PlaylistType -> PlaylistSimplified -> Html msg
playlistItem session playlistType playlist =
    let
        classes =
            classList
                [ ( "Playlist", True )
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


playlistList : Config -> Html msg
playlistList config =
    if List.length config.playlists /= 0 then
        div [ class "SidebarBody__item" ]
            [ div [ class "SidebarBody__title" ] [ text config.label ]
            , config.playlists
                |> listFilter config.playlistType
                |> List.map (playlistItem config.session config.playlistType)
                |> div []
            ]

    else
        text ""


view : Session -> Html msg
view session =
    div [ class "Sidebar" ]
        [ div [ class "SidebarHead" ]
            [ img [ class "SidebarHead__logo", src "./img/logo.png" ] []
            , text "Beardify"
            , span [ class "SidebarHead__version" ] [ text " alpha" ]
            ]
        , div [ class "Scrollable" ]
            [ div [ class "SidebarBody Scrollable__target" ]
                [ playlistList
                    { session = session
                    , playlistType = Albums
                    , playlists = session.playlists
                    , label = "Collections"
                    }
                , playlistList
                    { session = session
                    , playlistType = Tracks
                    , playlists = session.playlists
                    , label = "Playlists"
                    }
                ]
            ]
        ]
