<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Media\ImageConverter;

use Imagine\Image\ImageInterface;
use Sulu\Bundle\MediaBundle\Entity\FileVersion;

/**
 * Defines the operations of the ImageConverter
 * The ImageConverter is an interface to manage conversions of an Image. Converts
 * a media given by its original path according to the information passed in the format.
 */
interface ImageConverterInterface
{
    /**
     * Convert an image and return the tmpPath.
     *
     * @param string $formatKey
     * @param string $imageFormat
     *
     * @return ImageInterface
     */
    public function convert(FileVersion $fileVersion, $formatKey, $imageFormat);

    /**
     * Get supported image formats by mimeType.
     * The first returned image format will be used as default.
     *
     * @return string[]
     */
    public function getSupportedOutputImageFormats(?string $mimeType): array;
}
