<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Search\EventListener;

use Massive\Bundle\SearchBundle\Search\SearchManagerInterface;
use Sulu\Bundle\MediaBundle\Entity\Collection;
use Sulu\Bundle\MediaBundle\Entity\FileVersionMetaRepository;
use Sulu\Component\Security\Event\PermissionUpdateEvent;
use Sulu\Component\Security\Event\SecurityEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Removes a media from the index, as soon as it gets secured.
 */
class PermissionListener implements EventSubscriberInterface
{
    /**
     * @var FileVersionMetaRepository
     */
    private $fileVersionMetaRepository;

    /**
     * @var SearchManagerInterface
     */
    private $searchManager;

    public function __construct(
        FileVersionMetaRepository $fileVersionMetaRepository,
        SearchManagerInterface $searchManager
    ) {
        $this->fileVersionMetaRepository = $fileVersionMetaRepository;
        $this->searchManager = $searchManager;
    }

    public static function getSubscribedEvents(): array
    {
        return [SecurityEvents::PERMISSION_UPDATE => 'onPermissionUpdate'];
    }

    /**
     * Removes all FileVersionMetas belonging to the collection, which just got secured.
     */
    public function onPermissionUpdate(PermissionUpdateEvent $event)
    {
        if (Collection::class !== $event->getType()) {
            return;
        }

        foreach ($this->fileVersionMetaRepository->findByCollectionId($event->getIdentifier()) as $fileVersionMeta) {
            $this->searchManager->deindex($fileVersionMeta);
        }
    }
}
