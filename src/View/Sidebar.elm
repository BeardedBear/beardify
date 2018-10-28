module View.Sidebar exposing (view, viewCollections, viewPlaylists)

import Data.Drawer as Drawer exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
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


viewFolders : Drawer.Model -> List Playlists -> Bool -> Html Msg
viewFolders drawer playlists isClickable =
    let
        formatName n =
            n
                |> String.toLower
                |> String.left 3

        test =
            playlists
                |> List.filter (\f -> not <| String.contains "#C" f.name)
                |> LE.groupWhile (\a b -> formatName a.name == formatName b.name)
                |> List.filter (\( k, l ) -> not (List.isEmpty l))
    in
    test
        |> List.map
            (\( title, f ) ->
                div []
                    [ ul []
                        [ li [ class "folder-title" ]
                            [ i [ class "icon-folder" ] []
                            , label [ Html.Attributes.for title.name ] [ text title.name ]
                            ]
                        , input [ type_ "checkbox", id title.name ] []
                        , f
                            |> List.map
                                (\fe ->
                                    li
                                        [ if isClickable then
                                            onClick <| GetPlaylist fe.id

                                          else
                                            onClick NoOp
                                        , classList
                                            [ ( "playlist", True )
                                            , ( "active", drawer.drawerPlaylist.playlist.id == fe.id && drawer.drawerType == DrawPlaylist )
                                            ]
                                        ]
                                        [ i [ class "icon-music" ] [], text fe.name ]
                                )
                            |> ul []
                        ]
                    ]
            )
        |> div [ class "playlists-list" ]


viewPlaylists : Drawer.Model -> List Playlists -> Bool -> Html Msg
viewPlaylists drawer playlists isClickable =
    let
        formatName n =
            n
                |> String.toLower
                |> String.left 3

        test =
            playlists
                |> List.filter (\f -> not <| String.contains "#C" f.name)
                |> LE.groupWhile (\a b -> formatName a.name == formatName b.name)
                |> List.filter (\( k, l ) -> List.isEmpty l)
    in
    test
        |> List.map
            (\( title, _ ) ->
                div
                    [ if isClickable then
                        onClick <| GetPlaylist title.id

                      else
                        onClick NoOp
                    , classList
                        [ ( "playlist", True )
                        , ( "active", drawer.drawerPlaylist.playlist.id == title.id && drawer.drawerType == DrawPlaylist )
                        ]
                    ]
                    [ i [ class "icon-music" ] [], text title.name ]
            )
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
                , div [ class "folders" ]
                    [ div [ class "title" ] [ text "Folders" ]
                    , viewFolders model.drawer model.playlists True
                    ]
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists model.drawer model.playlists True
                    ]
                ]
            ]
        ]
