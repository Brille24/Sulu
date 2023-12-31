<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\PageBundle\Tests\Functional\ResourceLocator\Strategy;

use PHPCR\SessionInterface;
use Sulu\Bundle\DocumentManagerBundle\Bridge\DocumentInspector;
use Sulu\Bundle\TestBundle\Testing\SuluTestCase;
use Sulu\Component\Content\Exception\ResourceLocatorMovedException;
use Sulu\Component\Content\Exception\ResourceLocatorNotFoundException;
use Sulu\Component\Content\Types\ResourceLocator\Strategy\ResourceLocatorStrategyInterface;
use Sulu\Component\DocumentManager\DocumentManagerInterface;

class TreeFullEditStrategyTest extends SuluTestCase
{
    /**
     * @var ResourceLocatorStrategyInterface
     */
    private $resourceLocatorStrategy;

    /**
     * @var DocumentManagerInterface
     */
    private $documentManager;

    /**
     * @var DocumentInspector
     */
    private $documentInspector;

    /**
     * @var SessionInterface
     */
    private $session;

    public function setUp(): void
    {
        $this->resourceLocatorStrategy = $this->getContainer()->get('sulu_page_test.resource_locator.strategy.tree_full_edit');
        $this->documentManager = $this->getContainer()->get('sulu_document_manager.document_manager');
        $this->documentInspector = $this->getContainer()->get('sulu_document_manager.document_inspector');
        $this->session = $this->getContainer()->get('sulu_document_manager.default_session');

        $this->initPhpcr();
    }

    public function testDeleteByPath(): void
    {
        $rootNode = $this->session->getNode('/cmf/sulu_io/routes/de');

        $parentDocument = $this->documentManager->find('/cmf/sulu_io/contents');

        // create routes for content
        $news = $this->createDocument($parentDocument, 'news', '/news');
        $this->documentManager->persist($news, 'de');
        $this->documentManager->publish($news, 'de');
        $this->documentManager->flush();

        // move route
        $news = $this->documentManager->find($news->getUuid(), 'de');
        $news->setResourceSegment('/test');
        $this->resourceLocatorStrategy->save($news, null);
        $this->session->save();
        $this->session->refresh(false);

        $routeId = $rootNode->getNode('news')->getIdentifier();

        // delete a history url
        $this->resourceLocatorStrategy->deleteById($routeId, 'de');
        $this->assertFalse($rootNode->hasNode('news'));
        $this->assertTrue($rootNode->hasNode('test'));
    }

    public function testChangeResourceSegment(): void
    {
        $rootNode = $this->session->getNode('/cmf/sulu_io/routes/de');

        // create routes for content
        $parentDocument = $this->documentManager->find('/cmf/sulu_io/contents');

        $news = $this->createDocument($parentDocument, 'news', '/news');
        $this->documentManager->persist($news, 'de');
        $this->documentManager->publish($news, 'de');
        $this->documentManager->flush();

        $news1 = $this->createDocument($news, 'news-1', '/news/news-1');
        $this->documentManager->persist($news1, 'de');
        $this->documentManager->publish($news1, 'de');
        $this->documentManager->flush();

        // move route
        $news = $this->documentManager->find($news->getUuid(), 'de');
        $news->setResourceSegment('/test');
        $this->resourceLocatorStrategy->save($news, null);
        $this->session->save();
        $this->session->refresh(false);

        // check exist new routes
        $this->assertEquals(
            $news->getUuid(),
            $this->resourceLocatorStrategy->loadByResourceLocator('/test', 'sulu_io', 'de')
        );
        $this->assertTrue($rootNode->hasNode('news/news-1'));
        $this->assertFalse($rootNode->hasNode('test/news-1'));

        // check history
        $this->assertEquals('/test', $this->getRlForHistory('/news'));
    }

    public function testChangeResourceSegmentUnpublishedChildren(): void
    {
        $parentDocument = $this->documentManager->find('/cmf/sulu_io/contents');

        $google = $this->createDocument($parentDocument, 'google', '/google');
        $this->documentManager->persist($google, 'en');
        $this->documentManager->publish($google, 'en');
        $this->documentManager->flush();

        $news = $this->createDocument($google, 'news', '/google/news');
        $this->documentManager->persist($news, 'en');
        $this->documentManager->publish($news, 'en');
        $this->documentManager->flush();

        $austria = $this->createDocument($news, 'austria', '/google/news/austria');
        $this->documentManager->persist($austria, 'en');
        $this->documentManager->publish($austria, 'en');
        $this->documentManager->flush();

        $secret = $this->createDocument($google, 'secret', '/google/secret');
        $this->documentManager->persist($secret, 'en');
        $this->documentManager->flush();

        // secret is unpublished, therefore it is not part of the resource locator
        $virtualReality = $this->createDocument($secret, 'secret', '/google/virtual-reality');
        $this->documentManager->persist($virtualReality, 'en');
        $this->documentManager->publish($virtualReality, 'en');
        $this->documentManager->flush();

        // change resource segment from google to alphabet
        $google = $this->documentManager->find($google->getUuid(), 'en');
        $google->setResourceSegment('/alphabet');
        $this->documentManager->persist($google, 'en');
        $this->documentManager->publish($google, 'en');
        $this->documentManager->flush();

        // check updated routes
        $google = $this->documentManager->find($google->getUuid(), 'en');
        $this->assertEquals('/alphabet', $google->getResourceSegment());
        $this->assertEquals(
            $google->getUuid(),
            $this->resourceLocatorStrategy->loadByResourceLocator($google->getResourceSegment(), 'sulu_io', 'en')
        );

        $news = $this->documentManager->find($news->getUuid(), 'en');
        $this->assertEquals('/alphabet/news', $news->getResourceSegment());
        $this->assertEquals(
            $news->getUuid(),
            $this->resourceLocatorStrategy->loadByResourceLocator($news->getResourceSegment(), 'sulu_io', 'en')
        );

        $austria = $this->documentManager->find($austria->getUuid(), 'en');
        $this->assertEquals('/alphabet/news/austria', $austria->getResourceSegment());
        $this->assertEquals(
            $austria->getUuid(),
            $this->resourceLocatorStrategy->loadByResourceLocator($austria->getResourceSegment(), 'sulu_io', 'en')
        );

        $secret = $this->documentManager->find($secret->getUuid(), 'en');
        $this->assertEquals('/alphabet/secret', $secret->getResourceSegment());

        try {
            $this->resourceLocatorStrategy->loadByResourceLocator($secret->getResourceSegment(), 'sulu_io', 'en');
            $this->fail('resource locator found for unpublished page');
        } catch (ResourceLocatorNotFoundException $exc) {
            // everything ok; resource locator is not found because secret is not published
        }

        $virtualReality = $this->documentManager->find($virtualReality->getUuid(), 'en');
        $this->assertEquals('/alphabet/virtual-reality', $virtualReality->getResourceSegment());
        $this->assertEquals(
            $virtualReality->getUuid(),
            $this->resourceLocatorStrategy->loadByResourceLocator($virtualReality->getResourceSegment(), 'sulu_io', 'en')
        );
    }

    public function testGetInputType(): void
    {
        $this->assertEquals(ResourceLocatorStrategyInterface::INPUT_TYPE_FULL, $this->resourceLocatorStrategy->getInputType());
    }

    private function getRlForHistory($rl)
    {
        try {
            $this->resourceLocatorStrategy->loadByResourceLocator($rl, 'sulu_io', 'de');

            return false;
        } catch (ResourceLocatorMovedException $ex) {
            return $ex->getNewResourceLocator();
        }
    }

    private function createDocument($parentDocument, $title, $url)
    {
        $document = $this->documentManager->create('page');
        $document->setTitle($title);
        $document->setParent($parentDocument);
        $document->setStructureType('default');
        $document->setResourceSegment($url);

        // FIXME required because search indexing will fail otherwise
        $document->setExtensionsData(
            ['excerpt' => ['title' => '', 'description' => '', 'categories' => [], 'tags' => []]]
        );

        return $document;
    }
}
