module View.Sidebar exposing (view, viewCollections, viewPlaylists)

import Data.Drawer as Drawer exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)


viewCollections : Drawer.Model -> List Playlists -> Bool -> Html Msg
viewCollections drawer playlists isClickable =
    let
        collectionItem p =
            div
                [ if isClickable then
                    onClick <| GetCollection p.id

                  else
                    onClick <| ModalAddTrack p.id
                , classList
                    [ ( "playlist", True )
                    , ( "active", drawer.drawerCollection.playlist.id == p.id && drawer.drawerType == DrawCollection )
                    ]
                ]
                [ i [ class "icon-book" ] [], text p.name ]
    in
    playlists
        |> List.filter (\f -> String.contains "#C" f.name)
        |> List.map collectionItem
        |> div [ class "playlists-list" ]


viewPlaylists : Drawer.Model -> List Playlists -> Bool -> Html Msg
viewPlaylists drawer playlists isClickable =
    let
        playlistItem p =
            div
                [ if isClickable then
                    onClick <| GetPlaylist p.id

                  else
                    onClick NoOp
                , classList
                    [ ( "playlist", True )
                    , ( "active", drawer.drawerPlaylist.playlist.id == p.id && drawer.drawerType == DrawPlaylist )
                    ]
                ]
                [ i [ class "icon-music" ] [], text p.name ]
    in
    playlists
        |> List.filter (\f -> not (String.contains "#C" f.name))
        |> List.map playlistItem
        |> div [ class "playlists-list" ]


topMenuItem : Msg -> Drawer.Model -> DrawerType -> String -> String -> Html Msg
topMenuItem msg drawer page icon label =
    div
        [ onClick msg
        , classList [ ( "active", drawer.drawerType == page ) ]
        ]
        [ i [ class icon ] [], text label ]


view : Root.Model -> Html Msg
view model =
    div [ class "sidebar" ]
        [ div [ class "logo" ] [ text "Beardify" ]
        , div [ class "top-menu" ]
            [ topMenuItem GoHome model.drawer Home "icon-home" "Home"
            , topMenuItem GoReleases model.drawer Releases "icon-bell" "Sorties"
            , topMenuItem GoListen model.drawer Listen "icon-bookmark" "A écouter"
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ div [ class "collections" ]
                    [ div [ class "title" ] [ text "Collections" ]
                    , viewCollections model.drawer model.playlists True
                    ]
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists model.drawer model.playlists True
                    ]
                ]
            ]
        ]
