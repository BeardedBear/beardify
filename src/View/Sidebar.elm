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
            [ div [ onClick GoHome, classList [ ( "active", model.drawer.drawerType == Home ) ] ] [ i [ class "icon-home" ] [], text "Home" ]
            , div [ onClick GoReleases, classList [ ( "active", model.drawer.drawerType == Releases ) ] ] [ i [ class "icon-bell" ] [], text "Sorties" ]
            , div [ onClick GoListen, classList [ ( "active", model.drawer.drawerType == Listen ) ] ] [ i [ class "icon-bookmark" ] [], text "A écouter" ]
            ]
        , div [ class "collections" ]
            [ div [ class "title" ] [ text "Collections" ]
            , div [ class "playlists-list" ]
                [ div [ class "playlist" ] [ i [ class "icon-book" ] [], text "2018" ]
                , div [ class "playlist" ] [ i [ class "icon-book" ] [], text "2017" ]
                , div [ class "playlist" ] [ i [ class "icon-book" ] [], text "2016" ]
                , div [ class "playlist" ] [ i [ class "icon-book" ] [], text "2015" ]
                ]
            ]
        , div [ class "playlists" ]
            [ div [ class "title" ] [ text "Playlists" ]
            , div [ class "playlists-list" ]
                [ div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Compil tubes de l'été 1999" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chansons du Club Dorothée" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Hymnes nationaux" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Faire du sport !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chill" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Go to the PARTY !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Make war, don't love !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Move your body" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "En voiture Simone" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Dodo" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Bricolage" ]
                ]
            ]
        ]
