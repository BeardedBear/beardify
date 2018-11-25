module Views.Collection exposing (view)

-- import Data.Drawer exposing (..)
-- import Data.Player as Player exposing (..)
-- import Root exposing (..)

import Data.Collection
import Data.Image as Image exposing (..)
import Data.Playlist exposing (..)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Utils



-- import View.AlbumGallery as AlbumGallery exposing (..)


view : Data.Collection.Model -> Html msg
view model =
    let
        albums =
            model.albums.items
                |> List.map
                    (\a ->
                        { artists = a.track.artists
                        , album = a.track.album.name
                        , albumId = a.track.album.id
                        , albumUri = a.track.album.uri
                        , release_date = a.track.album.release_date
                        , images = a.track.album.images
                        , trackUri = a.track.uri
                        }
                    )

        albumItem al =
            div
                [ classList
                    [ ( "album", True )
                    ]
                ]
                [ div [ class "img" ] [ imageView Medium al.images ]
                , div [] [ text al.album ]
                , div [] (al.artists |> List.map (\ar -> a [ class "artist-name" ] [ text ar.name ]))
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")" ]
                , div [ class "playing-btn" ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                , div [ class "del-btn" ] [ i [ class "icon-del" ] [] ]
                ]
    in
    div []
        [ div [ class "heading-page" ] [ text <| String.replace "#Collection " "" model.collection.name ]
        , div []
            [ albums
                |> List.map albumItem
                |> div [ class "album-list-wrapper" ]
            ]
        ]



-- (model.albums.items |> List.map (\e -> div [] [ text e.track.album.name ]))
