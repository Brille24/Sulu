<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\DocumentManagerBundle\Tests\Unit\DataFixtures\fixtures;

use Sulu\Bundle\DocumentManagerBundle\DataFixtures\DocumentFixtureInterface;
use Sulu\Component\DocumentManager\DocumentManager;

class FoobarFixture implements DocumentFixtureInterface
{
    public function load(DocumentManager $documentManager): void
    {
    }

    public function getOrder()
    {
        return 10;
    }
}
