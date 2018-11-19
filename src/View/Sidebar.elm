module View.Sidebar exposing (view, viewCollections, viewPlaylists)

import Data.Drawer as Drawer exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)


viewCollections : Drawer.Model -> List PlaylistSimplified -> Bool -> Bool -> Html Msg
viewCollections drawer playlists isClickable hasTitle =
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


viewFolders : Drawer.Model -> List PlaylistSimplified -> Bool -> Html Msg
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
    if List.length test /= 0 then
        div [ class "folders" ]
            [ div [ class "title" ] [ text "Folders" ]
            , test
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
                                                [ i [ class "icon-list" ] [], text fe.name ]
                                        )
                                    |> ul []
                                ]
                            ]
                    )
                |> div [ class "playlists-list" ]
            ]

    else
        text ""



-- viewPlaylists : Drawer.Model -> List PlaylistSimplified -> Bool -> Html Msg
-- viewPlaylists drawer playlists isClickable =
--     let
--         formatName n =
--             n
--                 |> String.toLower
--                 |> String.left 3
--         test =
--             playlists
--                 |> List.filter (\f -> not <| String.contains "#Collection" f.name)
--                 |> LE.groupWhile (\a b -> formatName a.name == formatName b.name)
--                 |> List.filter (\( k, l ) -> List.isEmpty l)
--     in
--     test
--         |> List.map
--             (\( title, _ ) ->
--                 div
--                     [ if isClickable then
--                         onClick <| GetPlaylist title.id
--                       else
--                         onClick NoOp
--                     , classList
--                         [ ( "playlist", True )
--                         , ( "active", drawer.drawerPlaylist.playlist.id == title.id && drawer.drawerType == DrawPlaylist )
--                         ]
--                     ]
--                     [ i [ class "icon-list" ] [], text title.name ]
--             )
--         |> div [ class "playlists-list" ]


viewPlaylists : Drawer.Model -> List PlaylistSimplified -> Bool -> Html Msg
viewPlaylists drawer playlists isClickable =
    let
        test =
            playlists
                |> List.filter (\f -> not <| String.contains "#Collection" f.name)
    in
    test
        |> List.map
            (\title ->
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
                    [ i [ class "icon-list" ] [], text title.name ]
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
    div [ classList [ ( "sidebar", True ), ( "opened", model.config.openedMenu ) ] ]
        [ div [ class "logo" ]
            [ img [ src "./img/logo.png" ] []
            , text "Beardify"
            , span [ style "font-size" "0.9rem", style "opacity" "0.3" ] [ text " alpha" ]
            ]
        , div [ class "top-menu" ]
            [ topMenuItem GoHome model.drawer Home "icon-home" "Home"
            , topMenuItem GoReleases model.drawer Releases "icon-bell" "Sorties"

            -- , topMenuItem GoListen model.drawer Listen "icon-bookmark" "A écouter"
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ viewCollections model.drawer model.playlists True True

                -- , viewFolders model.drawer model.playlists True
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , viewPlaylists model.drawer model.playlists True
                    ]
                ]
            ]
        ]
