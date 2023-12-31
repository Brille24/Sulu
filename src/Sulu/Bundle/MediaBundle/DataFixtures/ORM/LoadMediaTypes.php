<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\ORM\Id\AssignedGenerator;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\Persistence\ObjectManager;
use Sulu\Bundle\MediaBundle\Entity\MediaType;

class LoadMediaTypes extends AbstractFixture implements OrderedFixtureInterface
{
    public function load(ObjectManager $manager)
    {
        // set id manually
        $metadata = $manager->getClassMetaData(MediaType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $mediaDocument = new MediaType();
        $mediaDocument->setId(1);
        $mediaDocument = $manager->merge($mediaDocument);
        $mediaDocument->setName('document');

        $mediaImage = new MediaType();
        $mediaImage->setId(2);
        $mediaImage = $manager->merge($mediaImage);
        $mediaImage->setName('image');

        $mediaVideo = new MediaType();
        $mediaVideo->setId(3);
        $mediaVideo = $manager->merge($mediaVideo);
        $mediaVideo->setName('video');

        $mediaAudio = new MediaType();
        $mediaAudio->setId(4);
        $mediaAudio = $manager->merge($mediaAudio);
        $mediaAudio->setName('audio');

        $manager->flush();
    }

    public function getOrder()
    {
        return 4;
    }
}
