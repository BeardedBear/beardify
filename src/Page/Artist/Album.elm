module Page.Artist.Album exposing (listView)

import Data.Album as Album exposing (AlbumSimplified)
import Data.Image as Image exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)



-- addHeadIf : (List (Html msg) -> Bool) -> List Html msg
-- addHeadIf function =
--     if func then
--       List.::


albumView : Album.AlbumSimplified -> Html msg
albumView album =
    let
        cover =
            Image.filterByWidth 600 album.images
    in
    div [ class "Album" ]
        [ a [ class "Album__link", href "#" ]
            [ img [ class "Album__cover", src cover.url ] []
            , button [ class "Album__play" ] [ i [ class "icon-play" ] [] ]
            , button [ class "Album__add" ] [ i [ class "icon-add" ] [] ]
            ]
        , div [ class "Album__name" ] [ text album.name ]
        , div [ class "Album__release" ] [ text album.releaseDate ]
        ]


listView : List AlbumSimplified -> Html msg
listView albums =
    List.map albumView albums
        |> div [ class "Artist__releaseList AlbumList" ]


listViewByType : Album.Type -> List AlbumSimplified -> Html msg
listViewByType type_ =
    List.filter (.type_ >> (==) type_)
        >> listView


typeHeading : Album.Type -> Html msg
typeHeading type_ =
    h2 [ class "Heading second" ] [ text <| Album.typeToString type_ ]
