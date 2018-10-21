module View.Sidebar exposing (view)

import Drawer exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)


view : Root.Model -> Html Msg
view model =
    div [ class "sidebar" ]
        [ div [ class "logo" ] [ text "Beardify" ]
        , div [ class "top-menu" ]
            [ div
                [ onClick GoHome
                , classList [ ( "active", model.drawer.drawerType == Home ) ]
                ]
                [ i [ class "icon-home" ] [], text "Home" ]
            , div
                [ onClick GoReleases
                , classList [ ( "active", model.drawer.drawerType == Releases ) ]
                ]
                [ i [ class "icon-bell" ] [], text "Sorties" ]
            , div
                [ onClick GoListen
                , classList [ ( "active", model.drawer.drawerType == Listen ) ]
                ]
                [ i [ class "icon-bookmark" ] [], text "A écouter" ]
            ]
        , div [ class "relative" ]
            [ div [ class "fit" ]
                [ div [ class "collections" ]
                    [ div [ class "title" ] [ text "Collections" ]
                    , div [ class "playlists-list" ]
                        (model.playlists
                            |> List.filter (\f -> String.contains "#C" f.name)
                            |> List.map
                                (\p ->
                                    div
                                        [ onClick <| GetC p.id
                                        , classList
                                            [ ( "playlist", True )
                                            , ( "active", model.drawer.drawerCollection.playlist.id == p.id )
                                            ]
                                        ]
                                        [ i [ class "icon-book" ] [], text p.name ]
                                )
                        )
                    ]
                , div [ class "playlists" ]
                    [ div [ class "title" ] [ text "Playlists" ]
                    , div [ class "playlists-list" ]
                        (model.playlists
                            |> List.filter (\f -> not (String.contains "#C" f.name))
                            |> List.map
                                (\p ->
                                    div
                                        [ onClick <| GetP p.id
                                        , classList
                                            [ ( "playlist", True )
                                            , ( "active", model.drawer.drawerPlaylist.playlist.id == p.id )
                                            ]
                                        ]
                                        [ i [ class "icon-music" ] [], text p.name ]
                                )
                        )
                    ]
                ]
            ]
        ]
