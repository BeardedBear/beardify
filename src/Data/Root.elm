module Data.Root exposing (AlbumModel, CollectionModel)

import Data.Album
import Data.Playlist
import Data.Track


type alias CollectionModel =
    { collection : Data.Playlist.Playlist
    , albums : Data.Playlist.PlaylistPaging
    }


type alias AlbumModel =
    { album : Data.Album.Album
    , tracks : List Data.Track.TrackSimplified
    }
