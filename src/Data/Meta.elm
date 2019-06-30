module Data.Meta exposing
    ( AlbumModel
    , ArtistModel
    , CollectionModel
    , PagingModel
    , PlaylistModel
    , pagingInit
    )

import Data.Album exposing (Album)
import Data.Artist exposing (Artist)
import Data.Modal exposing (ModalModel)
import Data.Playlist exposing (Playlist, PlaylistPaging)
import Data.Track exposing (Track, TrackSimplifiedPaging)
import Data.Youtube exposing (Video)


type alias PagingModel a =
    { items : List a
    , next : String
    }


pagingInit : PagingModel a
pagingInit =
    { items = []
    , next = ""
    }


type alias CollectionModel =
    { collection : Playlist
    , albums : PlaylistPaging
    , modal : ModalModel
    }


type alias PlaylistModel =
    { playlist : Playlist
    , tracks : PlaylistPaging
    }


type alias AlbumModel =
    { album : Album
    , tracks : TrackSimplifiedPaging
    , modal : ModalModel
    }


type alias ArtistModel =
    { artist : Artist
    , albums : List Album
    , videos : List Video
    , topTracks : List Track
    , relatedArtists : List Artist
    }
